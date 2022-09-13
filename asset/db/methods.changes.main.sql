CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_GET_FREE(config IN STRING, hocPhanTheoIdNganh OUT SYS_REFCURSOR,
                                           hocPhanDaXep OUT SYS_REFCURSOR, currentStatusRoom OUT SYS_REFCURSOR)
    RETURN SYS_REFCURSOR
AS
    my_cursor  SYS_REFCURSOR;
    khoaDangKy STRING(500);
    bac        STRING(10);
    he         STRING(10);
    khoaSv     STRING(4);
    namHoc     STRING(100);
    hocKy      STRING(1);
    listRoom   STRING(2000);
    --     now        STRING(20);
--     listIdHocPhan STRING(500);
begin
    SELECT JSON_VALUE(config, '$.khoaDangKy') INTO khoaDangKy FROM DUAL;
    SELECT JSON_VALUE(config, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(config, '$.loaiHinhDaoTao') INTO he FROM DUAL;
    SELECT JSON_VALUE(config, '$.khoaSinhVien') INTO khoaSv FROM DUAL;
    SELECT JSON_VALUE(config, '$.nam') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(config, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(config, '$.listRoom') INTO listRoom FROM DUAL;
    --     SELECT JSON_VALUE(config, '$.now') INTO now FROM DUAL;

    --     SELECT LISTAGG(TMP.ID_THOI_KHOA_BIEU, ',') WITHIN GROUP (ORDER BY TMP.ID_THOI_KHOA_BIEU)
--     INTO listIdHocPhan
--     FROM (SELECT DISTINCT TKBN.ID_THOI_KHOA_BIEU
--           FROM DT_THOI_KHOA_BIEU_NGANH TKBN
--           WHERE TKBN.ID_NGANH IN
--                 (SELECT regexp_substr(khoaDangKy, '[^,]+', 1, level)
--                  from dual
--                  connect by regexp_substr(khoaDangKy, '[^,]+', 1, level) is not null)) TMP;

    open hocPhanTheoIdNganh FOR
        SELECT DISTINCT TKBN.ID_NGANH                         AS "idNganh",
                        NDT.KHOA                              AS "khoa",
                        CN.KHOA                               AS "khoaCn",
                        (SELECT LISTAGG(DTTKB.ID, ',') WITHIN GROUP (ORDER BY DTTKB.ID)
                         FROM DT_THOI_KHOA_BIEU DTTKB
                                  LEFT JOIN DT_THOI_KHOA_BIEU_NGANH DTTKBN ON DTTKB.ID = DTTKBN.ID_THOI_KHOA_BIEU

                         WHERE DTTKBN.ID_NGANH = TKBN.ID_NGANH
                           AND TKB.IS_MO = 1
                           AND TKB.BAC_DAO_TAO = bac
                           AND TKB.LOAI_HINH_DAO_TAO = he
                           AND TKB.KHOA_SINH_VIEN = khoaSv
                           AND TKB.NAM = namHoc
                           AND TKB.HOC_KY = hocKy
                           AND TKB.LOAI_MON_HOC IS NULL
                           AND TKB.KHOA_DANG_KY = khoaDangKy) AS "idThoiKhoaBieu"
        FROM DT_THOI_KHOA_BIEU_NGANH TKBN
                 LEFT JOIN DT_THOI_KHOA_BIEU TKB ON TKB.ID = TKBN.ID_THOI_KHOA_BIEU
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = TKBN.ID_NGANH
                 LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON (TO_CHAR(CN.NGANH) || '&&' || TO_CHAR(CN.ID)) = TKBN.ID_NGANH
        WHERE TKB.IS_MO = 1
          AND TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy
          AND TKB.KHOA_DANG_KY = khoaDangKy
          AND TKB.LOAI_MON_HOC IS NULL;
    --           AND TKBN.ID_NGANH IN (SELECT regexp_substr(khoaDangKy, '[^,]+', 1, level)
--                                 from dual
--                                 connect by regexp_substr(khoaDangKy, '[^,]+', 1, level) is not null);
    open hocPhanDaXep FOR
        SELECT TKB.ID                                  AS "id",
               TKB.MA_MON_HOC                          AS "maMonHoc",
               TKB.THU                                 AS "thu",
               TKB.TIET_BAT_DAU                        AS "tietBatDau",
               TKB.SO_TIET_BUOI                        AS "soTietBuoi",
               TKB.TIET_BAT_DAU + TKB.SO_TIET_BUOI - 1 AS "tietKetThuc"
        FROM DT_THOI_KHOA_BIEU TKB
        WHERE TKB.THU IS NOT NULL
          AND TKB.TIET_BAT_DAU IS NOT NULL
          AND TKB.PHONG IS NOT NULL
          AND TKB.KHOA_DANG_KY = khoaDangKy
          AND TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.IS_MO = 1
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.LOAI_MON_HOC IS NULL
          AND TKB.HOC_KY = hocKy;
    --    AND TKB.ID IN (SELECT regexp_substr(listIdHocPhan, '[^,]+', 1, level)
--                          from dual
--                          connect by regexp_substr(listIdHocPhan, '[^,]+', 1, level) is not null);
    open currentStatusRoom for
        select TKB.PHONG        AS "phong",
               TKB.THU          AS "thu",
               TKB.TIET_BAT_DAU AS "tietBatDau",
               TKB.SO_TIET_BUOI AS "soTietBuoi"
        from DT_THOI_KHOA_BIEU TKB
                 LEFT JOIN DM_PHONG DMP ON DMP.MA = TKB.PHONG
                 LEFT JOIN DM_TOA_NHA DMTN ON DMTN.MA = DMP.TOA_NHA
        WHERE TKB.PHONG IS NOT NULL
          AND TKB.PHONG IN listRoom
          AND TKB.THU IS NOT NULL
          AND TKB.TIET_BAT_DAU IS NOT NULL
          AND TKB.IS_MO = 1
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy;

    open my_cursor for
        select TKB.ID                   AS "id",
               TKB.MA_MON_HOC           AS "maMonHoc",
               MH.TEN                   AS "tenMonHoc",
               TKB.BAC_DAO_TAO          AS "bacDaoTao",
               TKB.SO_TIET_BUOI         AS "soTietBuoi",
               TKB.IS_MO                AS "isMo",
               TKB.LOAI_HINH_DAO_TAO    AS "loaiHinhDaoTao",
               TKB.NHOM                 AS "nhom",
               TKB.THU                  AS "thu",
               TKB.LOAI_MON_HOC         AS "loaiMonHoc",
               TKB.SO_LUONG_DU_KIEN     AS "soLuongDuKien",
               TKB.SO_TIET_LY_THUYET    AS "soTietLyThuyet",
               TKB.TIET_BAT_DAU         AS "tietBatDau",
               TKB.SO_BUOI_TUAN         AS "soBuoiTuan",
               TKB.SO_TIET_THUC_HANH    AS "soTietThucHanh",
               (SELECT LISTAGG(sNDT.MA_NGANH, ',') WITHIN GROUP (
                   order by sTKB.ID
                   )
                FROM DT_THOI_KHOA_BIEU sTKB
                         INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                         INNER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                WHERE sTKB.ID = TKB.ID) AS "maNganh",

               (SELECT LISTAGG((TO_CHAR(sNDT.MA_NGANH) || '%' || sNDT.TEN_NGANH), '&&') WITHIN GROUP (
                   order by sTKB.ID
                   )
                FROM DT_THOI_KHOA_BIEU sTKB
                         INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                         INNER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                WHERE sTKB.ID = TKB.ID) AS "tenNganh",

               (SELECT LISTAGG(TO_CHAR(sCN.NGANH) || '%' || sCN.TEN, '&&') WITHIN GROUP (
                   order by sTKB.ID
                   )
                FROM DT_THOI_KHOA_BIEU sTKB
                         INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                         LEFT OUTER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                         INNER JOIN DT_DANH_SACH_CHUYEN_NGANH sCN
                                    ON (sCN.NGANH || '%' || TO_CHAR(sCN.ID)) = sTKBN.ID_NGANH
                WHERE sTKB.ID = TKB.ID) AS "tenChuyenNganh",

               (SELECT LISTAGG(sCN.ID, ',') WITHIN GROUP (
                   order by sTKB.ID
                   )
                FROM DT_THOI_KHOA_BIEU sTKB
                         INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                         LEFT OUTER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                         INNER JOIN DT_DANH_SACH_CHUYEN_NGANH sCN
                                    ON (sCN.NGANH || '%' || TO_CHAR(sCN.ID)) = sTKBN.ID_NGANH
                WHERE sTKB.ID = TKB.ID) AS "maChuyenNganh"
        From DT_THOI_KHOA_BIEU TKB
                 LEFT JOIN DM_MON_HOC MH ON MH.MA = TKB.MA_MON_HOC
        WHERE TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.PHONG IS NULL
          AND TKB.SO_TIET_BUOI IS NOT NULL
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy
          AND TKB.KHOA_DANG_KY = khoaDangKy
--     AND TKB.ID IN (SELECT regexp_substr(listIdHocPhan, '[^,]+', 1, level)
--                          from dual
--                          connect by regexp_substr(listIdHocPhan, '[^,]+', 1, level) is not null);
        ORDER BY TKB.MA_MON_HOC, TKB.NHOM, TKB.SO_TIET_BUOI DESC;
    return my_cursor;
end;

/
--EndMethod--