CREATE OR REPLACE FUNCTION DT_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, donVi IN STRING,
                                             searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_KHUNG_DAO_TAO KDT
             LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
             LEFT JOIN DT_NGANH_DAO_TAO DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
            LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

    WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
      AND (searchTerm = ''
        OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
        OR LOWER(TRIM(DNDT.TEN_NGANH)) LIKE sT
        OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT KDT.MA_KHOA           AS                     "maKhoa",
                        KHUNG.NAM_DAO_TAO       AS                     "namDaoTao",
                        KDT.ID                AS                     "id",
                        KDT.MA_NGANH          AS                     "maNganh",
                        DNDT.TEN_NGANH        AS                     "tenNganh",
                        BDT.TEN_BAC           AS                     "trinhDoDaoTao",
                        LHDT.TEN              AS                     "loaiHinhDaoTao",
                        KDT.THOI_GIAN_DAO_TAO AS                     "thoiGianDaoTao",
                        DV.TEN                AS                     "tenKhoaBoMon",

                        ROW_NUMBER() OVER (ORDER BY KDT.NAM_DAO_TAO DESC) R
                 FROM DT_KHUNG_DAO_TAO KDT
                          LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
                          LEFT JOIN DT_NGANH_DAO_TAO DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
                            LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

                          LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = KDT.TRINH_DO_DAO_TAO
                          LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = KDT.LOAI_HINH_DAO_TAO
                 WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
                   AND (searchTerm = ''
                     OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
                     OR LOWER(TRIM(DNDT.TEN_NGANH)) LIKE sT
                     OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
                     OR LOWER(TRIM(DV.TEN)) LIKE sT)
                 ORDER BY KDT.NAM_DAO_TAO DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",
                        qtdnn.SO_QD_TIEP_NHAN AS "soQdTiepNhan",
                        qtdnn.NOI_DUNG_TIEP_NHAN AS "noiDungTiepNhan",
                        qtdnn.NGAY_QD_TIEP_NHAN AS "ngayQdTiepNhan",
                        qtdnn.NGAY_VE_NUOC AS "ngayVeNuoc",
                        qtdnn.BAO_CAO_TINH_TRANG AS "baoCaoTinhTrang",
                        qtdnn.BAO_CAO_TEN AS "baoCaoTen",
                        qtdnn.BAO_CAO_LY_DO_TRA_VE AS "baoCaoLyDoTraVe",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                    AND (timeType IS NULL OR (
                                timeType = 1 AND
                                (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                        ) OR (
                            timeType = 2
                            AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                        ) OR (
                            timeType = 3
                            AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                        ) OR (
                            timeType = 4
                            AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                        ))
                    AND (tinhTrangCongTac IS NULL OR
                         (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
                         (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                         (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                         (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                    AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                    ))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                    OR LOWER(DMDNN.MO_TA) LIKE sT)
                 ORDER BY qtdnn.NGAY_DI DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_DI_NUOC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
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
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.SHCC             AS                  "shcc",

                        (SELECT COUNT(*)
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                            AND (mucDich IS NULL OR qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                            AND (timeType IS NULL OR (
                                        timeType = 1 AND
                                        (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                        (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                ) OR (
                                    timeType = 2
                                    AND (qtdnn_temp.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                ) OR (
                                    timeType = 3
                                    AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                ) OR (
                                    timeType = 4
                                    AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                ))
                            AND (tinhTrangCongTac IS NULL OR
                                 (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) < 30)) OR
                                 (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                 (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND qtdnn_temp.NGAY_DI <= today) OR
                                 (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                            ))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                            AND (mucDich IS NULL OR qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                            AND (timeType IS NULL OR (
                                        timeType = 1 AND
                                        (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                        (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                ) OR (
                                    timeType = 2
                                    AND (qtdnn_temp.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                ) OR (
                                    timeType = 3
                                    AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                ) OR (
                                    timeType = 4
                                    AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                ))
                            AND (tinhTrangCongTac IS NULL OR
                                 (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) < 30)) OR
                                 (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                 (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND qtdnn_temp.NGAY_DI <= today) OR
                                 (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                            ))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayDi",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                            AND (mucDich IS NULL OR qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                            AND (timeType IS NULL OR (
                                        timeType = 1 AND
                                        (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                        (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                ) OR (
                                    timeType = 2
                                    AND (qtdnn_temp.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                ) OR (
                                    timeType = 3
                                    AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                ) OR (
                                    timeType = 4
                                    AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                ))
                            AND (tinhTrangCongTac IS NULL OR
                                 (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) < 30)) OR
                                 (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                 (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND qtdnn_temp.NGAY_DI <= today) OR
                                 (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                            ))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayDiType",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                            AND (mucDich IS NULL OR qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                            AND (timeType IS NULL OR (
                                        timeType = 1 AND
                                        (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                        (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                ) OR (
                                    timeType = 2
                                    AND (qtdnn_temp.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                ) OR (
                                    timeType = 3
                                    AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                ) OR (
                                    timeType = 4
                                    AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                ))
                            AND (tinhTrangCongTac IS NULL OR
                                 (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) < 30)) OR
                                 (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                 (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND qtdnn_temp.NGAY_DI <= today) OR
                                 (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                            ))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayVe",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                            AND (mucDich IS NULL OR qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                            AND (timeType IS NULL OR (
                                        timeType = 1 AND
                                        (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                        (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                ) OR (
                                    timeType = 2
                                    AND (qtdnn_temp.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                ) OR (
                                    timeType = 3
                                    AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                ) OR (
                                    timeType = 4
                                    AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                ))
                            AND (tinhTrangCongTac IS NULL OR
                                 (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) < 30)) OR
                                 (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                 (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND qtdnn_temp.NGAY_DI <= today) OR
                                 (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                            ))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayVeType",

                        (select rtrim(xmlagg(xmlelement(e, DMDNN.MO_TA || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                            AND (mucDich IS NULL OR qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                            AND (timeType IS NULL OR (
                                        timeType = 1 AND
                                        (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                        (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                ) OR (
                                    timeType = 2
                                    AND (qtdnn_temp.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                ) OR (
                                    timeType = 3
                                    AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                ) OR (
                                    timeType = 4
                                    AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                    AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                ))
                            AND (tinhTrangCongTac IS NULL OR
                                 (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) < 30)) OR
                                 (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                 (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND qtdnn_temp.NGAY_DI <= today) OR
                                 (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                            ))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachMucDich",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM (SELECT *
                      FROM QT_DI_NUOC_NGOAI
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                ORDER BY qtdnn.NGAY_DI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DI_NUOC_NGOAI qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
        AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
        AND (timeType IS NULL OR (
                    timeType = 1 AND
                    (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                    (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
            ) OR (
                timeType = 2
                AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
            ) OR (
                timeType = 3
                AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
            ) OR (
                timeType = 4
                AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
            ))
        AND (tinhTrangCongTac IS NULL OR
             (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
             (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
             (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
             (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
        AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
        ))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
        OR LOWER(DMDNN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",
                        qtdnn.SO_QD_TIEP_NHAN AS "soQdTiepNhan",
                        qtdnn.NOI_DUNG_TIEP_NHAN AS "noiDungTiepNhan",
                        qtdnn.NGAY_QD_TIEP_NHAN AS "ngayQdTiepNhan",
                        qtdnn.NGAY_VE_NUOC AS "ngayVeNuoc",
                        qtdnn.BAO_CAO_TINH_TRANG AS "baoCaoTinhTrang",
                        qtdnn.BAO_CAO_TEN AS "baoCaoTen",
                        qtdnn.BAO_CAO_LY_DO_TRA_VE AS "baoCaoLyDoTraVe",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                    AND (timeType IS NULL OR (
                                timeType = 1 AND
                                (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                        ) OR (
                            timeType = 2
                            AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                        ) OR (
                            timeType = 3
                            AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                        ) OR (
                            timeType = 4
                            AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                        ))
                    AND (tinhTrangCongTac IS NULL OR
                         (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
                         (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                         (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                         (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                    AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                    ))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                    OR LOWER(DMDNN.MO_TA) LIKE sT)
                 ORDER BY qtdnn.NGAY_DI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

