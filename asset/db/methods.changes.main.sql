CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                              thoiGianPhanCong OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor            SYS_REFCURSOR;
    sT                   STRING(502) := '%' || lower(searchTerm) || '%';
    donVi                STRING(10);
    idNamDaoTao          STRING(10);
    hocKy                STRING(1);
    bacDaoTaoFilter      STRING(10);
    loaiHinhDaoTaoFilter STRING(10);
    phongFilter          STRING(10);
    thuFilter            STRING(2);
    giangVienFilter      STRING(10);
    monHocFilter         STRING(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.idNamDaoTao') INTO idNamDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTaoFilter') INTO bacDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHinhDaoTaoFilter') INTO loaiHinhDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phongFilter') INTO phongFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thuFilter') INTO thuFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.giangVienFilter') INTO giangVienFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.monHocFilter') INTO monHocFilter FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
             LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
             LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
--              LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
--                                     TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
    WHERE
--         (TGMM.KICH_HOAT = 1)AND
        (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
      AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
      AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
      AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
      AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
           loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
      AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
      AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
      AND (giangVienFilter IS NULL OR giangVienFilter = '' OR giangVienFilter = TKB.GIANG_VIEN)
      AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
      AND (searchTerm = ''
        OR LOWER(TRIM(DMMH.TEN)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT
        OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
        OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
        OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
        OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN thoiGianPhanCong FOR
        SELECT *
        FROM (SELECT TGPC.BAT_DAU                         AS "batDau",
                     TGPC.KET_THUC                        AS "ketThuc",
                     TGPC.DON_VI                          AS "donVi",
                     DV.TEN                               AS "tenDonVi",
                     CTKDT.NAM_DAO_TAO                    AS "namDaoTao",
                     TGPC.HOC_KY                          AS "hocKy",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA)     AS "tongSoLop",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA
                        AND (TKB.GIANG_VIEN IS NOT NULL)) AS "daPhanCong"

              FROM DT_THOI_GIAN_PHAN_CONG TGPC
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TGPC.NAM
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                       LEFT JOIN DM_DON_VI DV ON DV.MA = TGPC.DON_VI
              WHERE (donVi IS NULL OR donVi = '' OR donVi = TGPC.DON_VI));

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.ID                   AS          "id",
                     TKB.PHONG                AS          "phong",
                     TKB.THU                  AS          "thu",
                     TKB.TIET_BAT_DAU         AS          "tietBatDau",
                     TKB.SO_TIET_BUOI         AS          "soTiet",
                     TKB.HOC_KY               AS          "hocKy",
                     TKB.NAM                  AS          "nam",
                     TKB.MA_MON_HOC           AS          "maMonHoc",
                     TKB.NGAY_BAT_DAU         AS          "ngayBatDau",
                     TKB.NGAY_KET_THUC        AS          "ngayKetThuc",
                     TKB.LOAI_MON_HOC         AS          "loaiMonHoc",
                     TKB.NHOM                 AS          "nhom",
                     TKB.SO_LUONG_DU_KIEN     AS          "soLuongDuKien",
                     DV.TEN                   AS          "tenKhoaBoMon",
                     DV.MA                    AS          "maKhoaBoMon",
                     DMMH.TEN                 AS          "tenMonHoc",
                     DMMH.TONG_TIET           AS          "tongTiet",
                     TKB.KHOA_DANG_KY         AS          "khoaDangKy",
                     DV1.TEN                  AS          "tenKhoaDangKy",
                     CB.HO                    AS          "hoGiangVien",
                     CB.TEN                   AS          "tenGiangVien",
                     TKB.GIANG_VIEN           as          "giangVien",
                     TD.VIET_TAT              AS          "trinhDo",
                     TKB.SUC_CHUA             AS          "sucChua",
                     TKB.BUOI                 AS          "buoi",
                     TKB.IS_MO                AS          "isMo",
                     CTKDT.NAM_DAO_TAO        AS          "namDaoTao",
                     TKB.BAC_DAO_TAO          AS          "bacDaoTao",
                     TKB.LOAI_HINH_DAO_TAO    AS          "loaiHinhDaoTao",
                     LISTGV.LISTGV            AS          "listGiangVien",
                     LISTTG.LISTTG            AS          "listTroGiang",
                     (SELECT LISTAGG(sNDT.MA_NGANH, ',') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               INNER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "maNganh",

                     (SELECT LISTAGG((TO_CHAR(sNDT.MA_NGANH) || '%' || sNDT.TEN_NGANH), '&&') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               INNER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "tenNganh",

                     (SELECT LISTAGG(TO_CHAR(sCN.NGANH) || '%' || sCN.TEN, '&&') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               LEFT OUTER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                               INNER JOIN DT_DANH_SACH_CHUYEN_NGANH sCN
                                          ON (sCN.NGANH || '##' || TO_CHAR(sCN.ID)) = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "tenChuyenNganh",

                     (SELECT LISTAGG(sCN.ID, ',') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               LEFT OUTER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                               INNER JOIN DT_DANH_SACH_CHUYEN_NGANH sCN
                                          ON (sCN.NGANH || '##' || TO_CHAR(sCN.ID)) = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "maChuyenNganh",

--                      NDT.TEN_NGANH         AS             "tenNganh",
--                      CN.TEN                AS             "tenChuyenNganh",
                     TKB.KHOA_SINH_VIEN       AS          "khoaSinhVien",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                       LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                       LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                       LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU ID,LISTAGG(GV.GIANG_VIEN || '_' || TD.VIET_TAT || CB.HO || ' ' || CB.TEN, ',')
                            WITHIN GROUP (ORDER BY GV.GIANG_VIEN) LISTGV
                            FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                LEFT JOIN TCHC_CAN_BO CB on GV.GIANG_VIEN = CB.SHCC
                                LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                            WHERE TYPE = 'GV'
                            GROUP BY GV.ID_THOI_KHOA_BIEU
                            ORDER BY GV.ID_THOI_KHOA_BIEU) LISTGV on LISTGV.ID = TKB.ID
                       LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU ID,LISTAGG(GV.GIANG_VIEN || '_'|| TD.VIET_TAT || CB.HO || ' ' || CB.TEN, ',')
                            WITHIN GROUP (ORDER BY GV.GIANG_VIEN) LISTTG
                            FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                LEFT JOIN TCHC_CAN_BO CB on GV.GIANG_VIEN = CB.SHCC
                                LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                            WHERE TYPE = 'TG'
                            GROUP BY GV.ID_THOI_KHOA_BIEU
                            ORDER BY GV.ID_THOI_KHOA_BIEU) LISTTG on LISTTG.ID = TKB.ID
--                        LEFT JOIN DT_THOI_KHOA_BIEU_NGANH TKBN ON TKB.ID = TKBN.ID_THOI_KHOA_BIEU
--                        LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = TKBN.ID_NGANH
--                        LEFT OUTER JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON (CN.NGANH + '&&' + TO_CHAR(CN.ID)) = TKBN.ID_NGANH


--                        LEFT JOIN DT_THOI_GIAN_MO_MON TGMM
--                                  ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
--                                     TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
              WHERE
--                   (TGMM.KICH_HOAT = 1) AND
                  (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
                AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
                AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
                AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
                AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
                     loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
                AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
                AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
                AND (giangVienFilter IS NULL OR giangVienFilter = '' OR giangVienFilter = TKB.GIANG_VIEN)
                AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
                AND (searchTerm = ''
                  OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT
                  OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                  OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT)
              ORDER BY TKB.THU NULLS FIRST, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION SV_NHAP_HOC_GET_DATA(pMssv IN STRING, config IN STRING) RETURN sys_refcursor
AS
    my_cur SYS_REFCURSOR;
    namHoc NUMBER(4);
    hocKy  NUMBER(1);
BEGIN
    SELECT JSON_VALUE(config, '$.hocPhiNamHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(config, '$.hocPhiHocKy') INTO hocKy FROM DUAL;
    --     SELECT VALUE INTO namHoc FROM TC_SETTING WHERE KEY = 'hocPhiNamHoc';
--     SELECT VALUE INTO hocKy FROM TC_SETTING WHERE KEY = 'hocPhiHocKy';

    OPEN my_cur FOR
        SELECT stu.MSSV                                AS "mssv",
               (stu.HO || ' ' || stu.TEN)              AS "hoTen",
               (NDT.MA_NGANH || ': ' || NDT.TEN_NGANH) AS "nganhHoc",
               stu.LOAI_HINH_DAO_TAO                   AS "loaiHinhDaoTao",
               lHDT.TEN                                AS "heDaoTao",
               stu.NAM_TUYEN_SINH                      AS "namTuyenSinh",
               HP.CONG_NO                              AS "congNo",
               stu.NGAY_NHAP_HOC                       AS "ngayNhapHoc"
        FROM FW_STUDENT STU
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON lHDT.MA = STU.LOAI_HINH_DAO_TAO
                 LEFT JOIN TC_HOC_PHI HP ON HP.MSSV = STU.MSSV AND HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy
        WHERE STU.MSSV = pMssv;

    RETURN my_cur;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                filter IN STRING, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TC_INFO            SYS_REFCURSOR;
    namHoc             STRING(11);
    hocKy              STRING(4);
    listBacDaoTao      STRING(20);
    listLoaiHinhDaoTao STRING(50);
    listLoaiPhi        STRING(40);
    sT                 STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN

    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiPhi') INTO listLoaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_DINH_MUC_HOC_PHI TCDM
             LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
             LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.MA
    WHERE (searchTerm = '' OR lower(TCLP.TEN) LIKE sT)
      AND (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
      AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND
           TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                from dual
                                connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listLoaiPhi IS NULL OR
           listLoaiPhi IS NOT NULL AND
           TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                             from dual
                             connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                 from dual
                                 connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TC_INFO FOR
        SELECT *
        FROM (SELECT TCDM.HOC_KY           AS                  "hocKy",
                     TCDM.LOAI_PHI         AS                  "loaiPhi",
                     TCLP.TEN              AS                  "tenLoaiPhi",
                     TCDM.NAM_HOC          AS                  "namBatDau",
--                      TCDM.NAM_KET_THUC     AS                  "namKetThuc",
                     BDT.TEN_BAC           AS                  "tenBacDaoTao",
                     BDT.MA_BAC            AS                  "bacDaoTao",
                     LHDT.MA               AS                  "heDaoTaoDh",
                     DHS.MA                AS                  "heDaoTaoSdh",
                     LHDT.TEN              AS                  "tenHeDh",
                     DHS.TEN               AS                  "tenHeSdh",
--                      TCDM.SO_TIEN_MAC_DINH AS                  "soTienMacDinh",
                     ROW_NUMBER() OVER (ORDER BY TCDM.NAM_HOC) R
              FROM TC_DINH_MUC_HOC_PHI TCDM
                       LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
                       LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.MA
              WHERE (searchTerm = '' OR lower(TCLP.TEN) LIKE sT)
                AND (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
                AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (listLoaiPhi IS NULL OR
                     listLoaiPhi IS NOT NULL AND
                     TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
              )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN TC_INFO;
END;

/
--EndMethod--

