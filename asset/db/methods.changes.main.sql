CREATE OR REPLACE FUNCTION DT_DANH_SACH_CHUYEN_NGANH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                      filter IN STRING, searchTerm IN STRING,
                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    donVi     STRING(100);
    namHoc    STRING(100);
    maNganh   STRING(20);
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nam') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.maNganh') INTO maNganh FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_DANH_SACH_CHUYEN_NGANH chuyennganh
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = chuyennganh.NAM_HOC
             LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = chuyennganh.KHOA
             LEFT JOIN DT_NGANH_DAO_TAO nganh ON nganh.MA_NGANH = chuyennganh.NGANH

    WHERE (nganh.KICH_HOAT = 1 AND (donVi IS NULL OR donVi = '' OR donVi = chuyennganh.KHOA)
        AND (namHoc IS NULL OR namHoc = '' OR namHoc = chuyennganh.NAM_HOC)
        AND (maNganh IS NULL OR maNganh = '' OR maNganh = chuyennganh.NGANH)
        AND (searchTerm = ''
            OR LOWER(dmDv.TEN) LIKE sT
            OR LOWER(chuyennganh.TEN) LIKE sT
            OR LOWER(NGANH.TEN_NGANH) LIKE sT)
              );
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT chuyennganh.ID      as                       "id",
                     chuyennganh.NAM_HOC as                       "namHoc",
                     chuyennganh.NGANH   as                       "nganh",
                     chuyennganh.KHOA    as                       "khoa",
                     chuyennganh.TEN     as                       "ten",
                     nganh.TEN_NGANH     as                       "tenNganh",
                     dmDv.TEN            as                       "tenKhoa",
                     CT.NAM_DAO_TAO      AS                       "namDaoTao",
                     ROW_NUMBER() OVER (ORDER BY chuyennganh.TEN) R
              FROM DT_DANH_SACH_CHUYEN_NGANH chuyennganh
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = chuyennganh.NAM_HOC
                       LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = chuyennganh.KHOA
                       LEFT JOIN DT_NGANH_DAO_TAO nganh ON nganh.MA_NGANH = chuyennganh.NGANH
              WHERE (nganh.KICH_HOAT = 1 AND (donVi IS NULL OR donVi = '' OR donVi = chuyennganh.KHOA)
                  AND (namHoc IS NULL OR namHoc = '' OR namHoc = chuyennganh.NAM_HOC)
                  AND (maNganh IS NULL OR maNganh = '' OR maNganh = chuyennganh.NGANH)
                  AND (searchTerm = ''
                      OR LOWER(dmDv.TEN) LIKE sT
                      OR LOWER(chuyennganh.TEN) LIKE sT
                      OR LOWER(NGANH.TEN_NGANH) LIKE sT)
                        )
              order by chuyennganh.KHOA, chuyennganh.NGANH)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE procedure hcth_cong_van_di_update_so_cong_van(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER
)
IS
    maxThuTu number;
    tenVietTatDonViGui STRING(100);
    loaiVanBan STRING(10);
    loaiCongVan STRING(10);
    soCongVan STRING(200);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    begin
        SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;

        select MAX(SO_DI) into maxThuTu from HCTH_CONG_VAN_DI WHERE donViGui = DON_VI_GUI and (NGAY_TAO > nam) AND LOAI_CONG_VAN = loaiCongVan;

        SELECT dvg.TEN_VIET_TAT into tenVietTatDonViGui
        FROM DM_DON_VI dvg
        WHERE dvg.MA = donViGui;

        SELECT lcv.TEN_VIET_TAT into loaiVanBan
        FROM  HCTH_CONG_VAN_DI hcthCVD LEFT JOIN  DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_VAN_BAN
        WHERE hcthCVD.ID = ma;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;

    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

--     IF tenVietTatDonViGui IS NULL AND loaiVanBan IS NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/XHNV';
--     ELSIF tenVietTatDonViGui IS NULL AND loaiVanBan IS NOT NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/' + loaiVanBan || '-XHNV';
--     ELSIF tenVietTatDonViGui IS NOT NULL AND loaiVanBan IS NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/XHNV-' || tenVietTatDonViGui;
--     ELSE
--         soCongVan := TO_CHAR(maxThuTu) || '/' || loaiVanBan || '-XHNV-' || tenVietTatDonViGui;
--     end if;

    soCongVan := TO_CHAR(maxThuTu) || '/';
    IF loaiVanBan IS NOT NULL THEN
        soCongVan := soCongVan || loaiVanBan || '-';
    end if;

    soCongVan := soCongVan || 'XHNV';
    IF tenVietTatDonViGui IS NOT NULL THEN
        soCongVan := soCongVan || '-' || tenVietTatDonViGui;
    end if;

    update HCTH_CONG_VAN_DI hcthCVD set
    hcthCVD.SO_DI = maxThuTu,
    hcthCVD.TEN_VIET_TAT_DON_VI_GUI = tenVietTatDonViGui,
    hcthCVD.SO_CONG_VAN = soCongVan
    WHERE hcthCVD.ID = ma;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_GIAI_THUONG
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC ) GROUP BY SHCC)) qtgt
            LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
            LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
            LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
            LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtgt.ID           AS                "id",
                        qtgt.SHCC AS "shcc",

                        (SELECT COUNT(*)
                        FROM QT_GIAI_THUONG qtgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                           OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                           OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)
                        ) AS "soGiaiThuong",

                        (select rtrim(xmlagg(xmlelement(e, qtgt_temp.TEN_GIAI_THUONG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_GIAI_THUONG qtgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                           OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                           OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)
                        ) AS "danhSachGiaiThuong",

                        (select rtrim(xmlagg(xmlelement(e, qtgt_temp.NAM_CAP || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_GIAI_THUONG qtgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                           OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                           OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)
                        ) AS "danhSachNamCap",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                FROM (SELECT *
                        FROM QT_GIAI_THUONG
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC ) GROUP BY SHCC)) qtgt
                        LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                        LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                        LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                        LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                ORDER BY qtgt.NAM_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_GIAI_THUONG qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
      AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtgt.NOI_DUNG) LIKE sT
       OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
       OR LOWER(qtgt.SO_QUYET_DINH) LIKE sT
       OR LOWER(qtgt.NOI_CAP) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtgt.ID           AS                "id",
                        qtgt.TEN_GIAI_THUONG    AS "tenGiaiThuong",
                        qtgt.NOI_DUNG   AS "noiDung",
                        qtgt.NOI_CAP    AS "noiCap",
                        qtgt.NAM_CAP    AS "namCap",
                        qtgt.SHCC AS "shcc",
                        qtgt.SO_QUYET_DINH AS "soQuyetDinh",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                FROM QT_GIAI_THUONG qtgt
                         LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
                  AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(qtgt.NOI_DUNG) LIKE sT
                   OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
                   OR LOWER(qtgt.SO_QUYET_DINH) LIKE sT
                   OR LOWER(qtgt.NOI_CAP) LIKE sT)
                ORDER BY qtgt.NAM_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING, searchTerm IN STRING,
                                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING (100);
    listDv STRING (100);
    fromYear NUMBER(20);
    toYear NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_NGHE_NGHIEP cdnn on hd.CHUC_DANH_NGHE_NGHIEP = cdnn.MA
    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((listShcc IS NOT NULL AND
              ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR (listShcc = benA.SHCC)))
            OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
            OR (listShcc IS NULL AND listDv IS NULL))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.SHCC) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hd.SHCC              AS                 "shcc",
                     hd.ID                AS                 "ID",
                     benA.HO              AS                 "hoBenA",
                     benA.TEN             AS                 "tenBenA",
                     nguoiKy.SHCC         as                 "shccNguoiKy",
                     nguoiKy.HO           as                 "hoNguoiKy",
                     nguoiKy.TEN          as                 "tenNguoiKy",
                     nguoiKy.MA_CHUC_VU   as                 "chucVuNguoiKy",
                     nguoiKy.MA_DON_VI    as                 "donviNguoiKy",
                     hd.SO_HOP_DONG       as                 "soHopDong",
                     hd.LOAI_HOP_DONG     as                 "loaiHopDong",
                     dhd.TEN              as                 "tenLoaiHopDong",
                     hd.BAT_DAU_LAM_VIEC  as                 "batDauLamViec",
                     hd.KET_THUC_HOP_DONG as                 "ketThucHopDong",
                     hd.NGAY_TAI_KY       as                 "ngayTaiKy",
                     hd.DON_VI_TRA_LUONG  as                 "diaDiemLamViec",
                     dv.TEN               as                 "tenDiaDiemLamViec",
                     hd.CHUC_DANH_NGHE_NGHIEP         as                 "chucDanhNgheNghiep",
                     cdnn.TEN             as                 "tenChucDanhChuyenMon",
                     hd.NGACH             as                 "maNgach",
                     hd.BAC               as                 "bac",
                     hd.HE_SO             as                 "heSo",
                     hd.NGAY_KY_HOP_DONG  as                 "ngayKyHopDong",
                     hd.PHAN_TRAM_HUONG   as                 "phanTramHuong",
                     ROW_NUMBER() OVER (ORDER BY hd.ID DESC) R
              FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
                       LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                       LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
                       LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
                       LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
                       LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
                       LEFT JOIN DM_NGACH_CDNN cdnn on hd.CHUC_DANH_NGHE_NGHIEP = cdnn.MA
              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((listShcc IS NOT NULL AND
                        ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR
                         (listShcc = benA.SHCC)))
                      OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND
                           (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                AND (searchTerm = ''
                  OR LOWER(hd.NGUOI_KY) LIKE sT
                  OR LOWER(hd.SHCC) LIKE sT
                  OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                  OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                  OR LOWER(hd.SO_HOP_DONG) LIKE sT)
              ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    tinhTrang NUMBER;
    lyDo STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnp.ID            AS                       "id",
                        qtnp.SHCC          AS                       "shcc",
                        qtnp.LY_DO    AS                       "lyDo",
                        qtnp.LY_DO_KHAC AS "lyDoKhac",
                        qtnp.NOI_DEN       AS                       "noiDen",
                        qtnp.GHI_CHU            AS                  "ghiChu",
                        qtnp.BAT_DAU                AS              "batDau",
                        qtnp.BAT_DAU_TYPE           AS              "batDauType",
                        qtnp.KET_THUC               AS              "ketThuc",
                        qtnp.KET_THUC_TYPE          AS              "ketThucType",
                        qtnp.NGAY_DI_DUONG AS "ngayDiDuong",

                        today                       AS              "today",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",
                        cb.NGAY_BAT_DAU_CONG_TAC AS "ngayBatDauCongTac",

                        dmnp.MA AS "maNghiPhep",
                        dmnp.TEN AS "tenNghiPhep",
                        dmnp.SO_NGAY_PHEP AS "ngayNghiPhep",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
                 FROM QT_NGHI_PHEP qtnp
                          LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                          LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL) AND (lyDo IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                   AND (tinhTrang IS NULL OR
                        (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                        (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                        (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
                    AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
                    AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
                    AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level) from dual connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                 ORDER BY qtnp.BAT_DAU
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    tinhTrang NUMBER;
    lyDo STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_PHEP qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL) AND (lyDo IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (tinhTrang IS NULL OR
            (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
            (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
            (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
        AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
        AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
        AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level) from dual connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnp.LY_DO_KHAC) LIKE sT
        OR LOWER(qtnp.NOI_DEN) LIKE sT
        OR LOWER(dmnp.TEN) LIKE sT
        OR LOWER(qtnp.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnp.ID            AS                       "id",
                        qtnp.SHCC          AS                       "shcc",
                        qtnp.LY_DO    AS                       "lyDo",
                        qtnp.LY_DO_KHAC AS "lyDoKhac",
                        qtnp.NOI_DEN       AS                       "noiDen",
                        qtnp.GHI_CHU            AS                  "ghiChu",
                        qtnp.BAT_DAU                AS              "batDau",
                        qtnp.BAT_DAU_TYPE           AS              "batDauType",
                        qtnp.KET_THUC               AS              "ketThuc",
                        qtnp.KET_THUC_TYPE          AS              "ketThucType",
                        qtnp.NGAY_DI_DUONG AS "ngayDiDuong",

                        today                       AS              "today",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",
                        cb.NGAY_BAT_DAU_CONG_TAC AS "ngayBatDauCongTac",

                        dmnp.MA AS "maNghiPhep",
                        dmnp.TEN AS "tenNghiPhep",
                        dmnp.SO_NGAY_PHEP AS "ngayNghiPhep",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
                 FROM QT_NGHI_PHEP qtnp
                          LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                          LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL) AND (lyDo IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                   AND (tinhTrang IS NULL OR
                        (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                        (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                        (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
                    AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
                    AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
                    AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level) from dual connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtnp.LY_DO_KHAC) LIKE sT
                    OR LOWER(qtnp.NOI_DEN) LIKE sT
                    OR LOWER(dmnp.TEN) LIKE sT
                    OR LOWER(qtnp.GHI_CHU) LIKE sT)
                 ORDER BY qtnp.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_CAN_BO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                        searchTerm IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    canbosys        SYS_REFCURSOR;
    ST              STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc        STRING(100);
    listDonVi       STRING(100);
    listNgach       STRING(100);
    listHocVi       STRING(100);
    listChucDanh    STRING(100);
    gender          STRING(3);
    isBienChe       NUMBER;
    fromYear        NUMBER;
    toYear          NUMBER;
    listDanToc      STRING(100);
    listTonGiao     STRING(100);
    loaiHopDong     NUMBER;
    loaiChuyenVien  NUMBER;
    listQuocGia     STRING(100);
    fromAge         NUMBER;
    toAge           NUMBER;
    time            NUMBER;
    listChuyenNganh STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNgach') INTO listNgach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHocVi') INTO listHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isBienChe') INTO isBienChe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDanToc') INTO listDanToc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTonGiao') INTO listTonGiao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHopDong') INTO loaiHopDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiChuyenVien') INTO loaiChuyenVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listQuocGia') INTO listQuocGia FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge') INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge') INTO toAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChuyenNganh') INTO listChuyenNganh FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
             LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
             LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
             LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
             LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.DAN_TOC = dmTonGiao.MA

    WHERE (
            ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                OR (listShcc IS NULL AND listDonVi IS NULL))
            AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
            AND (listNgach IS NULL OR
                 listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
            AND (listHocVi IS NULL OR
                 listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
            AND (listChucDanh IS NULL OR
                 listChucDanh IS NOT NULL AND CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
            AND (isBienChe IS NULL OR
                 (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                 (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                )
            AND (fromYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
            AND (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
            AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
            AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
            AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                                         EXISTS(
                                                 SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                                 INTERSECT
                                                 SELECT regexp_substr(listQuocGia, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                             )
            ))
            AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
            AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
            AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                               (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                from dual)) / 12)
                                                                   from dual) >= fromAge))
            AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                             (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                              from dual)) / 12)
                                                                 from dual) <= toAge))
            AND
            (listChuyenNganh IS NULL OR (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
        )
      AND (NGAY_NGHI IS NULL OR NGAY_NGHI < time)
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE ST
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
        OR LOWER(CB.EMAIL) LIKE ST
        OR LOWER(CB.CHUYEN_NGANH) LIKE ST
        OR LOWER(CB.DANH_HIEU) LIKE ST
        OR LOWER(CB.GHI_CHU) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (SELECT CB.SHCC                                                    AS "shcc",
                     CB.HO                                                      AS "ho",
                     CB.TEN                                                     AS "ten",
                     CB.PHAI                                                    AS "phai",
                     CB.MA_DON_VI                                               AS "maDonVi",
                     DV.TEN                                                     AS "tenDonVi",
                     NG.MA                                                      AS "ngach",
                     NG.TEN                                                     AS "tenChucDanhNgheNghiep",
                     TRINH_DO.TEN                                               AS "hocVi",
                     CB.NAM_HOC_VI                                              AS "namHocVi",
                     CD.TEN                                                     AS "hocHam",
                     CB.NAM_CHUC_DANH                                           AS "namChucDanh",
                     CB.CHUYEN_NGANH_CHUC_DANH                                  AS "chuyenNganhChucDanh",
                     CB.NGAY_BAT_DAU_CONG_TAC                                   AS "ngayBatDauCongTac",
                     CB.NGAY_BIEN_CHE                                           AS "ngayBienChe",
                     CB.THAC_SI                                                 AS "thacSi",
                     CB.TIEN_SI                                                 AS "tienSi",
                     CB.CHUYEN_NGANH                                            AS "chuyenNganh",
                     CB.QUE_QUAN                                                AS "queQuan",
                     CB.IS_CVDT                                                 AS "isCvdt",
                     CB.IS_HDTN                                                 AS "isHdtn",
                     CB.HOC_VI_NOI_TOT_NGHIEP                                   AS "hocViNoiTotNghiep",
                     CB.TRINH_DO_PHO_THONG                                      AS "trinhDoPhoThong",
                     CB.HE_SO_LUONG                                             AS "heSoLuong",
                     CB.BAC_LUONG                                               AS "bacLuong",
                     CB.MOC_NANG_LUONG                                          AS "mocNangLuong",
                     CB.TY_LE_VUOT_KHUNG                                        AS "tyLeVuotKhung",
                     CB.CMND                                                    AS "cmnd",
                     CB.CMND_NGAY_CAP                                           AS "cmndNgayCap",
                     CB.CMND_NOI_CAP                                            AS "cmndNoiCap",
                     CB.DANH_HIEU                                               AS "danhHieu",
                     CB.DANG_VIEN                                               AS "dangVien",
                     CB.GHI_CHU                                                 AS "ghiChuStaff",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "chucVuChinh",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "maChucVuChinh",

                     (SELECT QTCV.NGAY_RA_QD
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "boNhiemNgay",

                     (SELECT DMCV.PHU_CAP
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "phuCapChucVu",
                     (CASE
                          WHEN CB.NGAY_BIEN_CHE IS NULL THEN 'Hợp đồng'
                          ELSE 'Biên chế'
                         END)                                                   AS "loaiCanBo",
                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by
                                          null).getclobval(), '-')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(CB.HOC_VI_NOI_TOT_NGHIEP, dmqg.MA_CODE) != 0) AS "danhSahcQuocGiaHocViNoiTotNghiep",
--                         (CASE
--                              WHEN CB.TIEN_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                   FROM QT_DAO_TAO qtdt
--                                   WHERE qtdt.SHCC = CB.SHCC
--                                     AND qtdt.TRINH_DO = '4' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatTienSi",
--                         (CASE WHEN CB.THAC_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                    FROM QT_DAO_TAO qtdt
--                                    WHERE qtdt.SHCC = CB.SHCC AND qtdt.TRINH_DO = '3' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatThacSi",

                     CB.NGAY_SINH                                               AS "ngaySinh",
                     CB.EMAIL                                                   AS "email",

                     dmDanToc.MA                                                AS "maDanToc",
                     dmDanToc.TEN                                               AS "tenDanToc",

                     dmTonGiao.MA                                               AS "maTonGiao",
                     dmTonGiao.TEN                                              AS "tenTonGiao",

                     ROW_NUMBER() OVER (ORDER BY CB.TEN)                           R
              FROM TCHC_CAN_BO CB
                       LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                       LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                       LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
                       LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
                       LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.TON_GIAO = dmTonGiao.MA

              WHERE (
                      ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                          OR
                       (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                          OR (listShcc IS NULL AND listDonVi IS NULL))
                      AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
                      AND (listNgach IS NULL OR
                           listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
                      AND (listHocVi IS NULL OR
                           listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
                      AND (listChucDanh IS NULL OR
                           listChucDanh IS NOT NULL AND
                           CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
                      AND (isBienChe IS NULL OR
                           (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                           (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                          )
                      AND (fromYear IS NULL OR
                           (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
                      AND
                      (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
                      AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
                      AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
                      AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                                                   EXISTS(
                                                           SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                                           INTERSECT
                                                           SELECT regexp_substr(listQuocGia, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                                       )
                      ))
                      AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
                      AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
                      AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                                         (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                          from dual)) /
                                                                                          12)
                                                                             from dual) >= fromAge))
                      AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                                       (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                        from dual)) /
                                                                                        12)
                                                                           from dual) <= toAge))
                      AND (listChuyenNganh IS NULL OR
                           (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
                  )
                AND (NGAY_NGHI IS NULL OR NGAY_NGHI < time)
                AND (searchTerm = ''
                  OR LOWER(CB.SHCC) LIKE ST
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                  OR LOWER(CB.EMAIL) LIKE ST
                  OR LOWER(CB.CHUYEN_NGANH) LIKE ST
                  OR LOWER(CB.DANH_HIEU) LIKE ST
                  OR LOWER(CB.GHI_CHU) LIKE ST)
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--

